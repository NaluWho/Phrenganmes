class TierListData {
    constructor(sTier = [], aTier = [], bTier = [], cTier = [], dTier = [], fTier = [], untiered = []) {
        this.sTier = sTier;
        this.aTier = aTier;
        this.bTier = bTier;
        this.cTier = cTier;
        this.dTier = dTier;
        this.fTier = fTier;
        this.untiered = untiered;
        this.nameToTier = {};
    }

    // Get the list of names in a given Tier
    getTierListArrayByLetter(tierLetter) {
        switch (tierLetter) {
            case "S":
                return this.sTier;
                break;
            case "A":
                return this.aTier;
                break;
            case "B":
                return this.bTier;
                break;
            case "C":
                return this.cTier;
                break;
            case "D":
                return this.dTier;
                break;
            case "F":
                return this.fTier;
                break;
            default:
                return this.untiered;
        }
    }

    // Add a Name to a Tier
    addToTier(tierLetter, name, index) {
        var tierListArr = this.getTierListArrayByLetter(tierLetter);
        tierListArr.splice(index, 0, name);
        this.nameToTier[name] = tierLetter;
    }

    // Remove a Name from a Tier given a name
    removeFromTier(name) {
        if (!this.nameToTier[name] && !this.untiered.includes(name)) {
            console.log("ERROR: ", name, " not in name dictionary.")
        }
        var tierListArr = this.getTierListArrayByLetter(this.nameToTier[name]);
        var nameIndex = tierListArr.indexOf(name);
        tierListArr.splice(nameIndex, 1);
    }
}

module.exports = TierListData;