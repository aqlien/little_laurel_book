require 'faker'

FactoryGirl.define do
  factory :address do
    street_1 { Faker::Address.street_address }
    street_2 { [Faker::Address.secondary_address, nil, nil].sample }
    city { Faker::Address.city }
    state { Faker::Address.state_abbr }
    zip { Faker::Address.zip }
    country 'USA'
  end
end
