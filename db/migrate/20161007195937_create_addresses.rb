class CreateAddresses < ActiveRecord::Migration[5.0]
  def change
    create_table :addresses do |t|
      t.string :street_1
      t.string :street_2
      t.string :city
      t.string :state
      t.string :country
      t.string :zip

      t.timestamps
    end
  end
end
