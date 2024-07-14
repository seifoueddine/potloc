class Store < ApplicationRecord
    has_many :shoes, dependent: :destroy
end
