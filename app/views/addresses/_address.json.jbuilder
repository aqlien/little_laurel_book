json.extract! address, :id, :street_1, :street_2, :city, :state, :country, :zip, :addressable_type, :addressable_id, :created_at, :updated_at
json.url address_url(address, format: :json)