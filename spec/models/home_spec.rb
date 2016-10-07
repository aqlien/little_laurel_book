require 'rails_helper'

RSpec.describe Home, type: :model do
  it "joins people and addresses" do
    expect(Home.new.respond_to?(:person)).to be true
    expect(Home.new.respond_to?(:address)).to be true
  end
end
