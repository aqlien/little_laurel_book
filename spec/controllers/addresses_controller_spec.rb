require 'rails_helper'

RSpec.describe AddressesController, type: :controller do

  let(:valid_attributes) { {street_1: 'Address Way'} }
  let(:invalid_attributes) { {street_1: nil} }
  let(:valid_session) { {} }

  describe "GET #index" do
    it "assigns all addresses as @addresses" do
      address = Address.create! valid_attributes
      get :index, params: {}, session: valid_session
      expect(assigns(:addresses)).to eq([address])
    end
  end

  describe "GET #show" do
    it "assigns the requested address as @address" do
      address = Address.create! valid_attributes
      get :show, params: {id: address.to_param}, session: valid_session
      expect(assigns(:address)).to eq(address)
    end
  end

  describe "GET #new" do
    it "assigns a new address as @address" do
      get :new, params: {}, session: valid_session
      expect(assigns(:address)).to be_a_new(Address)
    end
  end

  describe "GET #edit" do
    it "assigns the requested address as @address" do
      address = Address.create! valid_attributes
      get :edit, params: {id: address.to_param}, session: valid_session
      expect(assigns(:address)).to eq(address)
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Address" do
        expect {
          post :create, params: {address: valid_attributes}, session: valid_session
        }.to change(Address, :count).by(1)
      end

      it "assigns a newly created address as @address" do
        post :create, params: {address: valid_attributes}, session: valid_session
        expect(assigns(:address)).to be_a(Address)
        expect(assigns(:address)).to be_persisted
      end

      it "redirects to the created address" do
        post :create, params: {address: valid_attributes}, session: valid_session
        expect(response).to redirect_to(Address.last)
      end
    end

    context "with invalid params" do
      it "assigns a newly created but unsaved address as @address" do
        post :create, params: {address: invalid_attributes}, session: valid_session
        expect(assigns(:address)).to be_a_new(Address)
      end

      it "re-renders the 'new' template" do
        post :create, params: {address: invalid_attributes}, session: valid_session
        expect(response).to render_template("new")
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) { {street_1: 'New Street'} }

      it "updates the requested address" do
        address = Address.create! valid_attributes
        put :update, params: {id: address.to_param, address: new_attributes}, session: valid_session
        address.reload
        expect(address.street_1).to eq "New Street"
      end

      it "assigns the requested address as @address" do
        address = Address.create! valid_attributes
        put :update, params: {id: address.to_param, address: valid_attributes}, session: valid_session
        expect(assigns(:address)).to eq(address)
      end

      it "redirects to the address" do
        address = Address.create! valid_attributes
        put :update, params: {id: address.to_param, address: valid_attributes}, session: valid_session
        expect(response).to redirect_to(address)
      end
    end

    context "with invalid params" do
      it "assigns the address as @address" do
        address = Address.create! valid_attributes
        put :update, params: {id: address.to_param, address: invalid_attributes}, session: valid_session
        expect(assigns(:address)).to eq(address)
      end

      it "re-renders the 'edit' template" do
        address = Address.create! valid_attributes
        put :update, params: {id: address.to_param, address: invalid_attributes}, session: valid_session
        expect(response).to render_template("edit")
      end
    end
  end

  describe "DELETE #destroy" do
    it "destroys the requested address" do
      address = Address.create! valid_attributes
      expect {
        delete :destroy, params: {id: address.to_param}, session: valid_session
      }.to change(Address, :count).by(-1)
    end

    it "redirects to the addresses list" do
      address = Address.create! valid_attributes
      delete :destroy, params: {id: address.to_param}, session: valid_session
      expect(response).to redirect_to(addresses_url)
    end
  end

end
