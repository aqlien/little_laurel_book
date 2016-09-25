require 'rails_helper'

RSpec.describe Person, type: :model do
  it 'has a factory for testing' do
    expect(build(:person)).to be_valid
  end
end
