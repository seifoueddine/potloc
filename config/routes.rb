Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  namespace :api do
    resources :inventory, only: [:index]
    post 'trigger_websocket_connection', to: 'inventory#trigger_websocket_connection'
  end
end