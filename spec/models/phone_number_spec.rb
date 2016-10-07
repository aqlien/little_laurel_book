require 'rails_helper'

RSpec.describe PhoneNumber, type: :model do
  it 'has a factory for testing' do
    expect(build(:phone_number)).to be_valid
  end

  it 'validates presence of number' do
    expect(build(:phone_number, number: nil)).to be_invalid
  end
end
