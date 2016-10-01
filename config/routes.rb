Rails.application.routes.draw do
  resources :people
  resources :entry_forms, only: [:new, :create]
  root 'people#index'
end
