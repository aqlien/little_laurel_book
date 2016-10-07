class CreatePhoneNumbers < ActiveRecord::Migration[5.0]
  def change
    create_table :phone_numbers do |t|
      t.references :callable, polymorphic: true, index: true
      t.string :number
      t.string :phone
      t.boolean :primary

      t.timestamps
    end
  end
end
