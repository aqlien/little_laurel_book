source 'https://rubygems.org'

gem 'rails', '~> 5.0'
gem 'pg'
gem 'haml'

gem 'bootstrap'
gem 'sprockets-rails',  '>= 2.3.2' # required for Bootstrap 4
gem 'bootstrap_form'
gem 'font-awesome-rails' # get more icons

gem 'reform'
gem 'reform-rails' # required to specify validations for reform

# Rails defaults
gem 'coffee-rails', '~> 4.2' # Use CoffeeScript for .coffee assets and views
gem 'jbuilder', '~> 2.0' # Build JSON APIs with ease.
gem 'jquery-rails' # Use jquery as the JavaScript library
gem 'sass-rails', '~> 5.0' # Use SCSS for stylesheets
gem 'sdoc', '~> 0.4.0', group: :doc # bundle exec rake doc:rails generates the API under doc/api.
gem 'turbolinks' # Turbolinks makes following links in your web application faster.
gem 'uglifier', '>= 1.3.0' # Use Uglifier as compressor for JavaScript assets


group :production do
  gem 'rails_12factor'
end

group :development, :test do
  gem 'pry-rails'
end

group :development do
  gem 'haml-rails' # run rake haml:erb2haml to convert files
  gem 'spring' # Spring speeds up development by keeping your application running in the background.
  gem 'web-console', '~> 2.0' # Access an IRB console on exception pages or by using <%= console %> in views
end

group :test do
  gem 'faker'
  gem 'factory_girl_rails', '~> 4.0'
  gem 'rails-controller-testing'
  gem 'rspec-rails'
end

source 'https://rails-assets.org' do
  gem 'rails-assets-bootstrap'
  gem 'rails-assets-tether', '>= 1.1.0' # required for tooltips/popovers in Bootstrap 4
end
