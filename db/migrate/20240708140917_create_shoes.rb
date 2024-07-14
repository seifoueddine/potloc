class CreateShoes < ActiveRecord::Migration[7.1]
  def change
    create_table :shoes do |t|
      t.string :model
      t.references :store, null: false, foreign_key: true
      t.integer :inventory

      t.timestamps
    end
  end
end
