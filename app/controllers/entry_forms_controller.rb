class EntryFormsController < ApplicationController
  def new
    @entry_form = EntryForm.new
  end

  def create
    @entry_form = EntryForm.new(entry_form_params)
    if @entry_form.save
      redirect_to people_url, notice: 'Entry successfully created!'
    else
      render :new
    end
  end

private
  def entry_form_params
    params.require(:entry_form).permit(:first_name, :last_name, :middle_name, :suffix, :salutation, :birthday)
  end
end
