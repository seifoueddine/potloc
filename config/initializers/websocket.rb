# config/initializers/websocket.rb
require 'websocket_client'

Rails.application.config.after_initialize do
  puts "WebSocketClient initializer loaded"
  Thread.new { WebSocketClient.start }
end