Calcentral::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # enable threadsafe
  config.threadsafe!
  config.dependency_loading = true if $rails_rake_task

  # Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local = false

  # Disable Rails's static asset server (Apache or nginx will already do this)
  config.serve_static_assets = Settings.application.serve_static_assets

  # Compress JavaScripts and CSS
  config.assets.compress = true

  # Don't fallback to assets pipeline if a precompiled asset is missed
  config.assets.compile = false

  # Generate digests for assets URLs
  config.assets.digest = true

  # Defaults to nil and saved in location specified by config.assets.prefix
  # config.assets.manifest = YOUR_PATH

  # Specifies the header that your server uses for sending files
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  # config.force_ssl = true

  # See everything in the log (default is :info)
  # config.log_level = :debug

  # Prepend all log lines with the following tags
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Enable serving of images, stylesheets, and JavaScripts from an asset server
  # config.action_controller.asset_host = "http://assets.example.com"

  # Precompile additional assets (application.js, application.css, and all non-JS/CSS are already added)
  # config.assets.precompile += %w( search.js )

  # Disable delivery errors, bad email addresses will be ignored
  # config.action_mailer.raise_delivery_errors = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  # Log the query plan for queries taking more than this (works
  # with SQLite, MySQL, and PostgreSQL)
  # config.active_record.auto_explain_threshold_in_seconds = 0.5

  # Caching store
  config.cache_store = ActiveSupport::Cache.lookup_store(
      :dalli_store,
      *Settings.cache.servers,
      {
          :expires_in => Settings.cache.maximum_expires_in,
          :namespace => ServerRuntime.get_settings["git_commit"],
          :race_condition_ttl => Settings.cache.race_condition_ttl
      }
  )
  config.cache_store.logger = Logger.new("#{CalcentralLogging.log_root}/cache_#{Time.now.strftime('%Y-%m-%d')}.log")
  config.cache_store.logger.level = Logger::ERROR

end