Rails.application.routes.draw do
  resources :phone_numbers
  resources :addresses
  resources :people
  resources :entry_forms, only: [:new, :create, :edit, :update]
  root 'people#index'
end
