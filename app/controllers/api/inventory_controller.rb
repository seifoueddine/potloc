module Api
  class InventoryController < ApplicationController
    def index
      inventory = WebSocketClient.aggregate_data
      alerts = WebSocketClient.generate_alerts(inventory)
      render json: { inventory: inventory, alerts: alerts }
    end

    def trigger_websocket_connection
      Thread.new { WebSocketClient.start }
      render json: { message: 'WebSocket connection attempt triggered' }, status: :ok
    end
  end
end
