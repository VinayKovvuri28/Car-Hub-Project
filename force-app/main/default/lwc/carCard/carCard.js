import { LightningElement, wire } from 'lwc';
import carhub_logo from '@salesforce/resourceUrl/carhub_logo';
//LightningMessageChannel and LightningMessageService
import { subscribe,unsubscribe,MessageContext,APPLICATION_SCOPE } from 'lightning/messageService';
import CARFILTERED from '@salesforce/messageChannel/CarFiltered__c';
// uiRecordApi
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
//navigation
import { NavigationMixin } from 'lightning/navigation';
//Car__c Schema
import NAME_FIELD from '@salesforce/schema/Car__c.Name'
import PICTURE_URL_FIELD from '@salesforce/schema/Car__c.Picture_URL__c'
import CATEGORY_FIELD from '@salesforce/schema/Car__c.Category__c'
import MAKE_FIELD from '@salesforce/schema/Car__c.Make__c'
import MSRP_FIELD from '@salesforce/schema/Car__c.MSRP__c'
import FUEL_FIELD from '@salesforce/schema/Car__c.Fuel_Type__c'
import SEATS_FIELD from '@salesforce/schema/Car__c.Number_of_Seats__c'
import CONTROL_FIELD from '@salesforce/schema/Car__c.Control__c'

export default class CarCard extends NavigationMixin(LightningElement) {

    placeholder = {
        message :'Select a Car to see details',
        img_Url:carhub_logo
    }
    message ='Select a Car to see details'
    //subscription reference for carSelected
    subscription
    // car fields displayed with specific format
    carImage
    carName
    carObjectApiName
    //Id of Car__c to display data
    recordId
    fields = [NAME_FIELD, PICTURE_URL_FIELD]

    //exposing fields to make them available in the template
    categoryField = CATEGORY_FIELD
    makeField = MAKE_FIELD 
    msrpField = MSRP_FIELD
    fuelField = FUEL_FIELD
    seatsField = SEATS_FIELD
    controlField = CONTROL_FIELD

    /*** getRecord ***/
    @wire(getRecord, {recordId:'$recordId', fields:'$fields'})
    wireGetRecord({data,error}){
        if(data){
            console.log('car record: ', data)
            this.carObjectApiName = data.apiName
            this.carName = data.fields.Name.displayValue ? data.fields.Name.displayValue: data.fields.Name.value
            // this.carName = getFieldValue(data, NAME_FIELD)
            this.carImage = getFieldValue(data, PICTURE_URL_FIELD)
        }
        if(error){
            console.log('error ', error)
        }
    }

    /*** Load context for LMS ***/
    @wire(MessageContext)
    messageContext

    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                CARFILTERED,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription)
        this.subscription = null
    }

    // Handler for message received by component
    handleMessage(message) {
        console.log('message.carId',message.carId)
        this.recordId = message.carId
    }

    // Standard lifecycle hooks used to subscribe and unsubsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    /*** Navigate To The Car Record Page ***/
    handleNavigateToRecord(event){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                 // Different per page type. 
                // Check documentation: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type
                recordId: this.recordId,
                objectApiName:this.carObjectApiName,
                actionName: 'view'
            },
            state: {
                 // Different per page type.
            }
        });
    }
}