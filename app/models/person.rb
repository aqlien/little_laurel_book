class Person < ApplicationRecord

  validates :first_name, {presence: true}

  def display_name
    "#{first_name} #{last_name}"
  end

end
