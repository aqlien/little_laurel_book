class Address < ApplicationRecord

  has_many :homes
  has_many :people, through: :homes
  has_many :phone_numbers, as: :callable

  validates :street_1, {presence: true}

  def full(split_street = true)
    "#{street_1}#{split_street ? "\n" : ' '}#{street_2}\n#{city} #{state} #{zip}"
  end

end
