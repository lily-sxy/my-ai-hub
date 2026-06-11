class FoldersController < ApplicationController
  def index
    render json: Folder.order(:position).all
  end

  def create
    folder = Folder.new(name: params[:name], id: SecureRandom.uuid)
    folder.save!
    render json: folder, status: :created
  end

  def destroy
    Folder.find(params[:id]).destroy!
    render json: { ok: true }
  end
end
