import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
//LightningMessageChannel and LightningMessageService
import { publish, MessageContext} from 'lightning/messageService';
import CARFILTERED from '@salesforce/messageChannel/CarFiltered__c';

//Car Schema
import CAR_OBJECT from '@salesforce/schema/Car__c';
import CATEGORY_FIELD from '@salesforce/schema/Car__c.Category__c';
import MAKE_FIELD from '@salesforce/schema/Car__c.Make__c';

//Constants
const CATEGORY_ERROR = 'ERROR LOADING CATEGORIES';
const MAKE_ERROR = 'ERROR LOADING MAKERS';

export default class CarFilter extends LightningElement {
    categoryError = CATEGORY_ERROR
    makeError = MAKE_ERROR
    categoryOptions = []
    makeOptions = []
    timerId
    filters={
        searchKey:'',
        maxPrice:1799900,
        selectedCategory:'',
        selectedMake:'',
    }

    /*** Load context for LMS ***/
    @wire(MessageContext)
    messageContext

    /*** Fetching Car ObjectInfo ***/
    @wire(getObjectInfo, {objectApiName:CAR_OBJECT})
    wireCarObjectInfo

    /*** Fetching Catgeory Picklist ***/
    @wire(getPicklistValues, {fieldApiName: CATEGORY_FIELD, recordTypeId: '$wireCarObjectInfo.data.defaultRecordTypeId'})
    wireGetCategoryPicklistValues({data,error}){
        if(data){
            // console.log('Category field data:', data);
            this.categoryOptions = [...this.generatePickList(data)]
            // console.log('this.categoryOptions:', JSON.stringify(this.categoryOptions));
            this.filters = {...this.filters, "selectedCategory" : this.generateValues(this.categoryOptions)}
        }
        if(error){
            console.error(error)
        }
    }

    /*** Fetching Make Picklist ***/
    @wire(getPicklistValues, {fieldApiName: MAKE_FIELD, recordTypeId: '$wireCarObjectInfo.data.defaultRecordTypeId'})
    wireGetMakePicklistValues({data,error}){
        if(data){
            //console.log('Make field data:', data);
            this.makeOptions = [...this.generatePickList(data)]
            // console.log('this.makeOptions:', JSON.stringify(this.makeOptions));
            this.filters = {...this.filters, "selectedMake" : this.generateValues(this.makeOptions)}
        }
        if(error){
            console.error(error)
        }
    }

    /*** Function to create options from data ***/
    generatePickList(data){
        return data.values.map(item=>({label: item.label, value: item.value}))
    }

    /*** Function to create values from options ***/
    generateValues(options){
        if(Array.isArray(options)){
            return options.map((item => item.value))
        } 
    }

    /*** Search Key Handler ***/
    handleSearchKeyChange(event){
        // console.log(event.target.value);
        this.filters = {...this.filters, "searchKey" : event.target.value}
        this.sendDataToCatList()
    }

    /*** Max Price Handler ***/
    handleMaxPriceChange(event){
        // console.log(event.target.value);
        this.filters = {...this.filters, "maxPrice" : event.target.value}
        this.sendDataToCatList()
    }

    /*** Category Selected Handler ***/
    categorySelectedHandle(event){
        this.filters = {...this.filters, "selectedCategory" : event.detail.value}
        //this.selectedCategory = event.detail.value
        this.sendDataToCatList()
    }

    /*** Make Selected Handler ***/
    makeSelectedHandle(event){
        this.filters = {...this.filters, "selectedMake" : event.detail.value}
        //this.selectedMake = event.detail.value
        this.sendDataToCatList()
    }

    sendDataToCatList(){
        window.clearTimeout(this.timerId)
        this.timerId = setTimeout(()=>{
            publish(this.messageContext, CARFILTERED, {
                filters: this.filters
            });
            //console.log('filters: ', JSON.stringify(this.filters))
        }, 500)
    }
}