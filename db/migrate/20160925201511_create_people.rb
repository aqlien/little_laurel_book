class CreatePeople < ActiveRecord::Migration[5.0]
  def change
    create_table :people do |t|
      t.string :first_name
      t.string :last_name
      t.string :middle_name
      t.string :suffix
      t.string :salutation
      t.date :birthday

      t.timestamps
    end
  end
end
