class PhoneNumber < ApplicationRecord
  belongs_to :callable, polymorphic: true

  validates :number, presence: true
end
