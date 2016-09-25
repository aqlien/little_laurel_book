require 'rails_helper'

RSpec.describe "people/index", type: :view do
  before(:each) do
    assign(:people, [
      create(:person),
      create(:person)
    ])
  end

  it "renders a list of people" do
    render
  end
end
