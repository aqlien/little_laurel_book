class Person < ApplicationRecord

  has_many :homes
  has_many :addresses, through: :homes

  validates :first_name, {presence: true}

  def display_name
    "#{first_name} #{last_name}"
  end

end
