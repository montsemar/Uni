# Descriptive Analysis
hist(Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`,  xlab = "Concrete Compressive Strength", main = "Histogram")
suppressWarnings(library(summarytools))
descr(Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`)     
boxplot(Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, ylab= "Concret Compressive Strength", main = "Box Plot")

#Algorithm we used to find the best fit for distribution fitting.
best <- 0
root <- 0
for (i in 200:600){
  transformed_data <- (Compressive_strength)^(i * 0.001)
  Partition <- hist(transformed_data, plot = FALSE) 
  
  normalfit <- fitdist(transformed_data, "norm") 
  
  CummulativeProbabilities = pnorm(c(-Inf, Partition$breaks[c(-1,-1 * (length(Partition$breaks)))], Inf), normalfit$estimate[1], normalfit$estimate[2])
  Probabilities = diff(CummulativeProbabilities)
  Expected = length(transformed_data)*Probabilities 
  res <- chisq.test(Partition$counts, p = Probabilities)
  
  temp <- pchisq(res$statistic, res$parameter -2, lower.tail = FALSE)
  if (temp > best){
    best <- temp
    root <- i * 0.001
  }
}

#Distribution Fitting
data <- Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`
transformed_data <- data^(0.537)
hist(transformed_data, xlab = "Concrete Compressive Strength", main = "Histogram", probability = TRUE)
curve(dnorm(x, mean = mean(transformed_data), sd = sd(transformed_data)), col = "blue", add=TRUE)

library(fitdistrplus)
normalfit <- fitdistr(transformed_data, "normal")
normalfit
Partition <- hist(transformed_data, plot = FALSE)
Partition
CummulativeProbabilities = pnorm(c(-Inf, Partition$breaks[c(-1,-11)], Inf), normalfit$estimate[1], normalfit$estimate[2])
Probabilities = diff(CummulativeProbabilities)
Expected = length(data)*Probabilities
chisq.test(Partition$counts, p = Probabilities)
pchisq(11.886, 7, lower.tail = FALSE)

# computing propability. I compute the probabilities of the quartiles to test that it works correctly
pnorm(23.70^(0.537), mean = 6.63130609, sd = 1.76523328)
pnorm(34.44^(0.537), mean = 6.63130609, sd = 1.76523328)
pnorm(46.20^(0.537), mean = 6.63130609, sd = 1.76523328)
#example for the poster.
pnorm(40^(0.537), mean = 6.63130609, sd = 1.76523328, lower.tail = FALSE)

#we divide the sample by age: younger than 45.66 days (the sample mean of age) or older
new <- Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`[Concrete_Data_Statistics$`Age (day)`< 45.66]
old <- Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`[Concrete_Data_Statistics$`Age (day)`> 45.66]
hist(new, xlab = "Concrete Compressive Strength", main = "New")
hist(old, xlab = "Concrete Compressive Strength", main="Old")

# Since the population is large enough we don't need to fit them to a normal distribution.
# Hypothesis Testing. H0: μ1 = μ2 ; H1: μ1 < μ2. Confidence level of 95%. alpha = 0.05.
library(BSDA)
z.test(old, new, alternative = "less",sigma.x = sd(old), sigma.y = sd(young))
pnorm(17.935, lower.tail = FALSE)

# Confidence Interval
z.test(old, new, alternative = "less", sigma.x = sd(old), sigma.y = sd(young))$conf.int

# Multiple Regression
plot(Concrete_Data_Statistics)
# XY graphs
plot(Concrete_Data_Statistics$`Cement (component 1)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Cement", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Blast Furnace Slag (component 2)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Blast Furnace Slag", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Fly Ash (component 3)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Fly Ash", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Water  (component 4)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Water", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Superplasticizer (component 5)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Superplasticizer", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Coarse Aggregate  (component 6)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Coarse Aggregate", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Fine Aggregate (component 7)(kg in a m^3 mixture)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Fine Aggregate", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`Age (day)` ,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="Age", ylab="Concrete Compressive Strength")
plot(Concrete_Data_Statistics$`High Resistance (True or False)`,Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)`, xlab="High Resistance", ylab="Concrete Compressive Strength")

#Initial model.
model<-lm(Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)` ~Concrete_Data_Statistics$`Cement (component 1)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Blast Furnace Slag (component 2)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Fly Ash (component 3)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Water  (component 4)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Superplasticizer (component 5)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Coarse Aggregate  (component 6)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Fine Aggregate (component 7)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Age (day)` + Concrete_Data_Statistics$`High Resistance (True or False)`,data=Concrete_Data_Statistics)
summary(model)
plot(model)
#Normality of residuals.
hist(model$residuals, probability = TRUE, xlab = "Residuals")
curve(dnorm(x, mean(model$residuals), sd(model$residuals)), col="blue", lwd=2, add=TRUE, yaxt="n")
library(nortest)
pearson.test(model$residuals)
# We got low p-value so we chose to eliminate coarse aggregate because of their low significance.
model<-lm(Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)` ~Concrete_Data_Statistics$`Cement (component 1)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Blast Furnace Slag (component 2)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Fly Ash (component 3)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Water  (component 4)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Superplasticizer (component 5)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Fine Aggregate (component 7)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Age (day)` + Concrete_Data_Statistics$`High Resistance (True or False)`,data=Concrete_Data_Statistics)
summary(model)
plot(model)
#Normality of residuals.
hist(model$residuals, probability = TRUE, xlab = "Residuals")
curve(dnorm(x, mean(model$residuals), sd(model$residuals)), col="blue", lwd=2, add=TRUE, yaxt="n")
library(nortest)
pearson.test(model$residuals)
# we got a large enough p-value but superplasticizer and fine aggregate are not significant anymore.
model<-lm(Concrete_Data_Statistics$`Concrete compressive strength(MPa, megapascals)` ~Concrete_Data_Statistics$`Cement (component 1)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Blast Furnace Slag (component 2)(kg in a m^3 mixture)` + Concrete_Data_Statistics$`Fly Ash (component 3)(kg in a m^3 mixture)`+ Concrete_Data_Statistics$`Water  (component 4)(kg in a m^3 mixture)`+ Concrete_Data_Statistics$`Age (day)` + Concrete_Data_Statistics$`High Resistance (True or False)`,data=Concrete_Data_Statistics)
summary(model)
plot(model)
#Normality of residuals.
hist(model$residuals, probability = TRUE, xlab = "Residuals")
curve(dnorm(x, mean(model$residuals), sd(model$residuals)), col="blue", lwd=2, add=TRUE, yaxt="n")
library(nortest)
pearson.test(model$residuals)
# all variables are significant and p-value is large enough so this will be the final model.
