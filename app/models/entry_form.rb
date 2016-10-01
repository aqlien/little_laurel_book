class EntryForm
  include ActiveModel::Model
  include Virtus

  attribute :first_name, String
  attribute :middle_name, String
  attribute :last_name, String
  attribute :suffix, String
  attribute :salutation, String
  attribute :birthday, Date

  validates :first_name, {presence: true}

  def save
    if valid?
      persist!
      true
    else
      false
    end
  end

private
  def persist!
    person = Person.create(person_attributes)
  end

  def person_attributes
    { first_name: first_name, middle_name: middle_name, last_name: last_name, suffix: suffix, salutation: salutation, birthday: birthday }
  end
end
