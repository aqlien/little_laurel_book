class CreateHomes < ActiveRecord::Migration[5.0]
  def change
    create_table :homes do |t|
      t.integer :person_id
      t.integer :address_id
      t.boolean :primary

      t.timestamps
    end
  end
end
