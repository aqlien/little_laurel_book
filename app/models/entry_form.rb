class EntryForm < Reform::Form
  include Composition

  model :person

  property :first_name,   on: :person
  property :middle_name,  on: :person
  property :last_name,    on: :person
  property :suffix,       on: :person
  property :salutation,   on: :person
  property :birthday,     on: :person

  validates :first_name, presence: true

end
