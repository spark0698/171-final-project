

average_participation = "<b>Average Participation</b> refers to the average number of people on SNAP in a given calendar year. While the number has fluctuated between about 15 million and 30 million people before 2008, we see that the Great Recession caused this number to increase almost 50% to a peak of 45 million. Though the economy has improved signficantly in the past 6 years, average participation has not fallen signficantly, suggesting that the economic recovery may not have done much to improve the lives of the most food insecure."
average_benefit = "<b>Average Benefit</b> refers to the average monthly aid allocated to people on SNAP. While the benefit historically tracked closely with inflation and corresponding rises in cost of living, it spiked due to the Great Recession, and has stayed at this heightened level since."
total_benefit = "<b>Total Benefit</b> refers to the total amount of money given to people on SNAP. This only represents the Federal Government portion of aid, which only represents roughly half of the aid that is given out (this varies by state)."
other_costs = "<b>Other Costs</b> refers to the administrative costs associated with implementing the program. In this case, it represents less than 8% of the total expenditure of SNAP."
total_costs ="<b>Total Costs</b> refers to the total cost of the program, which is simply the sum of total benefits and other costs."


function chooseExplanation(name) {

	if (name == 'average_participation') {
		return average_participation
	}
	else if (name == 'average_benefit') {
		return average_benefit
	}
	else if (name == 'total_benefit') {
		return total_benefit
	}

	else if (name=='other_costs') {
		return other_costs
	}

	else if (name=='total_costs') {
		return total_costs
	}
	else {
		return ''
	}
}