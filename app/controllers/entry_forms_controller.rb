class EntryFormsController < ApplicationController
  before_action :set_person, only: [:show, :edit, :update, :destroy]

  def new
    @entry_form = EntryForm.new(person: Person.new())
  end

  def create
    @entry_form = EntryForm.new(entry_form_params.to_h)
    if @entry_form.validate(params)
      @entry_form.save
      redirect_to people_url, notice: 'Entry successfully created!'
    else
      render :new
    end
  end

  def edit
    @entry_form = EntryForm.new(person: @person)
  end

  def update
    @entry_form = EntryForm.new(entry_form_params.to_h)
    if @entry_form.save
      redirect_to people_url, notice: 'Entry successfully created!'
    else
      render :new
    end
  end

private

  def set_person
    @person = Person.find(params[:id])
  end

  def entry_form_params
    params.require(:entry_form).permit(
      person_params
    )
  end

  def person_params
    [:first_name, :last_name, :middle_name, :suffix, :salutation, :birthday]
  end
end
