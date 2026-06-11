Rails.application.routes.draw do
  resources :folders, only: [:index, :create, :destroy]

  resources :threads, only: [:index, :create, :update, :destroy] do
    member do
      delete :permanent
      post   :restore
    end
    resources :messages, only: [:index, :create]
  end

  resources :tasks, only: [:index, :create, :update, :destroy]

  get "/", to: proc { [200, {}, [{ status: "ok" }.to_json]] }
end
