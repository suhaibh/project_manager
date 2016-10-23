class Plan < ActiveRecord::Base
	PLANS = [:free, :premium]

	def self.options
		PLANS.map {|plan| [plan.capitalize, plan]}
	end
end