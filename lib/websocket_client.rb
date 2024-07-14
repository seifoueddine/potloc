require 'json'
require 'eventmachine'
require 'websocket-eventmachine-client'

module WebSocketClient
  WEBSOCKET_URL = "ws://#{ENV['WEBSOCKET_HOST']}:8080/".freeze
  MAX_ATTEMPTS = 2

  def self.start
    EM.run { connect_to_websocket }
  end

  def self.connect_to_websocket(attempts = 0)
    ws = WebSocket::EventMachine::Client.connect(uri: WEBSOCKET_URL)

    ws.onopen do
      puts "WebSocket connection opened"
      attempts = 0
    end

    ws.onmessage do |msg, _|
      handle_message(JSON.parse(msg))
    end

    ws.onerror do |e|
      puts "Error: #{e}"
      ws.close
    end

    ws.onclose do
      handle_close(attempts)
    end
  end

  def self.handle_message(data)
    store = Store.find_or_create_by(name: data['store'])
    shoe = store.shoes.find_or_create_by(model: data['model'])
    shoe.update(inventory: data['inventory'])

    aggregated_data = aggregate_data
    alerts = generate_alerts(aggregated_data)

    ActionCable.server.broadcast 'inventory_channel', { inventory: aggregated_data, alerts: alerts }
  end

  def self.handle_close(attempts)
    puts "Connection closed"
    if attempts < MAX_ATTEMPTS
      puts "Reconnecting attempt #{attempts + 1}"
      EM.add_timer(2) { connect_to_websocket(attempts + 1) }
    else
      ActionCable.server.broadcast 'inventory_channel', { error: 'WebSocket connection error' }
      EM.stop
    end
  end

  def self.aggregate_data
    Store.includes(:shoes).all.map do |store|
      {
        name: store.name,
        shoes: store.shoes.map { |shoe| { model: shoe.model, inventory: shoe.inventory } }
      }
    end
  end

  def self.generate_alerts(data)
    data.flat_map do |store|
      store[:shoes].filter_map do |shoe|
        next if shoe[:inventory] >= 10

        severity = shoe[:inventory] < 3 ? 'high' : 'medium'
        {
          message: "Low inventory for #{shoe[:model]} at #{store[:name]}: #{shoe[:inventory]} units",
          severity: severity
        }
      end
    end
  end
end
