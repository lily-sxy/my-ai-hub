class ThreadsController < ApplicationController
  def index
    threads = params[:include_deleted] == "true" ? Thread.deleted : Thread.active
    render json: threads.order(created_at: :desc)
  end

  def create
    thread = Thread.new(thread_params)
    thread.id = SecureRandom.uuid
    thread.save!
    render json: thread, status: :created
  end

  def update
    thread = Thread.find(params[:id])
    thread.update!(thread_params)
    render json: thread
  end

  def destroy
    thread = Thread.find(params[:id])
    thread.update!(deleted_at: Time.current)
    render json: { ok: true }
  end

  def permanent
    Thread.find(params[:id]).destroy!
    render json: { ok: true }
  end

  def restore
    thread = Thread.find(params[:id])
    thread.update!(deleted_at: nil)
    render json: { ok: true }
  end

  private

  def thread_params
    params.permit(:title, :model, :folder_id, :summary)
  end
end
