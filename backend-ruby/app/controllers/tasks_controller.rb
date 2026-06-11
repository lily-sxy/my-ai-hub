class TasksController < ApplicationController
  def index
    tasks = params[:date] ? Task.where(date: params[:date]) : Task.all
    render json: tasks.order(:created_at)
  end

  def create
    task = Task.new(task_params)
    task.id = SecureRandom.uuid
    task.save!
    render json: task, status: :created
  end

  def update
    task = Task.find(params[:id])
    task.update!(task_params)
    render json: task
  end

  def destroy
    Task.find(params[:id]).destroy!
    render json: { ok: true }
  end

  private

  def task_params
    params.permit(:title, :date, :done, :source_thread_id)
  end
end
