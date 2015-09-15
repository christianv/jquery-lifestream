module Oec
  class ReportDiffTask < Task

    attr_accessor :diff_reports_per_dept
    attr_accessor :errors_per_dept

    def run_internal
      @diff_reports_per_dept = {}
      @errors_per_dept = {}
      Oec::CourseCode.by_dept_code(@course_code_filter).keys.each do |dept_code|
        if (diff_report = analyze dept_code)
          diff_reports_per_dept[dept_code] = diff_report
          file_name = "#{timestamp}_#{Berkeley::Departments.get(dept_code, concise: true).downcase.tr(' ', '_')}_courses_diff"
          upload_worksheet(diff_report, file_name, find_or_create_today_subfolder('reports'))
          log :info, "#{dept_code} diff summary: reports/#{datestamp}/#{file_name}"
        end
      end
      log_errors
    end

    def analyze(dept_code)
      dept_name = Berkeley::Departments.get(dept_code, concise: true)
      sis_data = csv_row_hash([@term_code, 'imports', datestamp, dept_name], dept_code)
      record_error(dept_code, @term_code, "#{dept_name} has no #{datestamp} 'imports' spreadsheet") && return unless sis_data
      dept_data = csv_row_hash([@term_code, 'departments', dept_name, 'Courses'], dept_code)
      record_error(dept_code, @term_code, "#{dept_name} has no 'Courses' spreadsheet") && return unless dept_data
      keys_of_rows_with_diff = []
      intersection = (sis_keys = sis_data.keys) & (dept_keys = dept_data.keys)
      (sis_keys | dept_keys).select do |key|
        if intersection.include? key
          column_with_diff = columns_to_compare.detect do |column|
            # Anticipate nil column values
            sis_value = sis_data[key][column].to_s
            dept_value = dept_data[key][column].to_s
            sis_value.casecmp(dept_value) != 0
          end
          keys_of_rows_with_diff << key if column_with_diff
        else
          keys_of_rows_with_diff << key
        end
      end
      keys_of_rows_with_diff.any? ? create_diff_report(sis_data, dept_data, keys_of_rows_with_diff) : nil
    end

    private

    def create_diff_report(sis_data, dept_data, keys)
      diff_report = Oec::DiffReport.new @opts
      keys.each do |key|
        sis_row = sis_data[key]
        dept_row = dept_data[key]
        ldap_uid = sis_row ? sis_row['LDAP_UID'] : dept_row['LDAP_UID']
        id = "#{key[:term_yr]}-#{key[:term_cd]}-#{key[:ccn]}"
        id << "-#{key[:ldap_uid]}" unless key[:ldap_uid].to_s.empty?
        diff_row = { '+/-' => diff_type_symbol(sis_row, dept_row), 'KEY' => id, 'LDAP_UID' => ldap_uid }
        columns_to_compare.each do |column|
          diff_row["DB_#{column}"] = sis_row ? sis_row[column] : nil
          diff_row[column] = dept_row ? dept_row[column] : nil
        end
        diff_report[key] = diff_row
      end
      diff_report
    end

    def diff_type_symbol(sis_row, dept_row)
      return ' ' if sis_row && dept_row
      dept_row ? '+' : '-'
    end

    def columns_to_compare
      %w(COURSE_NAME FIRST_NAME LAST_NAME EMAIL_ADDRESS INSTRUCTOR_FUNC)
    end

    def csv_row_hash(folder_titles, dept_code)
      return unless (file = @remote_drive.find_nested(folder_titles, @opts))
      hash = {}
      csv = @remote_drive.export_csv file
      Oec::SisImportSheet.from_csv(csv, dept_code: dept_code).each do |row|
        row = Oec::Worksheet.capitalize_keys row
        next unless (id_hash = extract_id(dept_code, row))
        hash[id_hash] = row
      end
      hash
    end

    def extract_id(dept_code, row)
      errors = []
      id = hashed row
      annotation = id[:annotation]
      errors << "Invalid CCN annotation: #{annotation}" if (annotation && !%w(A B GSI CHEM MCB).include?(annotation))
      id[:ldap_uid] = row['LDAP_UID'] unless row['LDAP_UID'].blank?
      errors << "Invalid ldap_uid: #{id[:ldap_uid]}" if (id[:ldap_uid] && id[:ldap_uid].to_i <= 0)
      id[:instructor_func] = row['INSTRUCTOR_FUNC'] unless row['INSTRUCTOR_FUNC'].blank?
      errors << "Invalid instructor_func: #{id[:instructor_func]}" if (id[:instructor_func] && !(0..4).include?(id[:instructor_func].to_i))
      errors.each { |error| record_error(dept_code, id[:ccn], error) }
      errors.any? ? nil : id
    end

    def hashed(row)
      id = row['COURSE_ID'].split '-'
      ccn_plus_tag = id[2].split '_'
      hash = { term_yr: id[0], term_cd: id[1], ccn: ccn_plus_tag[0] }
      hash[:annotation] = ccn_plus_tag[1] if ccn_plus_tag.length == 2
      hash
    end

    def record_error(dept_code, ccn, error)
      return unless error
      @errors_per_dept[dept_code] ||= {}
      @errors_per_dept[dept_code][ccn] ||= []
      @errors_per_dept[dept_code][ccn] << error
    end

    def log_errors
      message = ''
      @errors_per_dept.each do |dept_code, errors_hash|
        message.concat <<-summary

#{Berkeley::Departments.get(dept_code)} errors
        summary
        errors_hash.each do |id, errors|
          message.concat <<-summary
  #{id}:
    #{errors.join("\n    ").concat "\n"}
          summary
        end
      end
      log :error, message unless message.blank?
    end

  end
end
