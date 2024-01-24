/**
 * @description       : Apex controller to getting list of car record
 * @author            : Vinay Kovvuri
 * @group             : 
 * @last modified on  : 01-24-2024
 * @last modified by  : Vinay Kovvuri
**/
public with sharing class CarController {
    //wrapper class
    public class Filters{
        @AuraEnabled
        public String searchKey {get; set;}
        @AuraEnabled
        public Decimal maxPrice {get; set;}
        @AuraEnabled
        public String[] selectedCategory {get; set;}
        @AuraEnabled
        public String[] selectedMake {get; set;}

    }

    @AuraEnabled(cacheable=true)
    public static List<Car__c> getCarList(Filters filters){
        try {
            String key, whereClause ='';
            Decimal maxPrice;
            String[] selectedCategory, selectedMake, criteria = new List<String>{};
            if(filters != null){
                maxPrice = filters.maxPrice;
                selectedCategory = filters.selectedCategory;
                selectedMake = filters.selectedMake;
                if(!String.isEmpty(filters.searchKey)){
                    key = '%'+filters.searchKey+'%';
                    criteria.add('Name LIKE: key');
                }
                if(filters.maxPrice>= 0){
                    criteria.add('MSRP__c <= :maxPrice');
                }
                if(filters.selectedCategory != null){
                    criteria.add('Category__c IN : filters.selectedCategory');
                }
                if(filters.selectedMake != null){
                    criteria.add('Make__c IN : filters.selectedMake');
                }
                if(criteria.size()>0) {
                    whereClause = ' WHERE ' + String.join(criteria, ' AND ');
                }
            }

            String query = 'SELECT Id, Name, Category__c, Control__c, Description__c, Fuel_Type__c, Make__c, MSRP__c, Number_of_Seats__c, Picture_URL__c FROM Car__c' + whereClause + ' WITH SECURITY_ENFORCED ORDER BY Name';
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Car__c[] getSimilarCars(Id carId, String[] makeType){
        try {
            return [SELECT Id, Name, MSRP__c, Description__c, Category__c, Picture_URL__c, Make__c FROM Car__c WHERE Make__c IN :makeType AND Id != :carId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}