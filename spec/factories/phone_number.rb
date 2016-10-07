require 'faker'

FactoryGirl.define do
  factory :phone_number do
    number { Faker::PhoneNumber.phone_number }
    phone { ['home','work','cell'].sample }
  end
end
