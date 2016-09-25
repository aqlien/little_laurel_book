require 'rails_helper'

RSpec.describe Person, type: :model do
  it 'has a factory for testing' do
    expect(build(:person)).to be_valid
  end

  it 'validates presence of first_name' do
    expect(build(:person, first_name: nil)).to be_invalid
  end

end
