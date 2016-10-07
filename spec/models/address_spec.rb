require 'rails_helper'

RSpec.describe Address, type: :model do
  it 'has a factory for testing' do
    expect(build(:address)).to be_valid
  end

  it 'validates presence of street_1' do
    expect(build(:address, street_1: nil)).to be_invalid
  end
end
