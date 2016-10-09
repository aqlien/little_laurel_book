class Person < ApplicationRecord

  has_many :homes
  has_many :addresses, through: :homes
  has_many :phone_numbers, as: :callable

  accepts_nested_attributes_for :addresses, allow_destroy: true
  accepts_nested_attributes_for :phone_numbers, allow_destroy: true

  validates :first_name, {presence: true}

  def display_name
    "#{first_name} #{last_name}"
  end

end
