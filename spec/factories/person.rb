require 'faker'

FactoryGirl.define do
  factory :person do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    middle_name { [Faker::Name.first_name, Faker::Name.last_name, nil, nil].sample }
    suffix { Faker::Name.suffix if rand(10) == 1 }
    salutation { ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Lord', 'Lady', 'Sir', 'Dame', nil].sample }
    birthday { Faker::Date.between(100.years.ago, 1.day.ago) }
  end
end
