#include<bits/stdc++.h>
using namespace std;


int main(){

    int maxlen=0;

    for(int i=0; i<n;i++){

        int hash[26]={0};

        for(int j=i;j<n;j++){

            hash[s[j]]++;

            maxj=max(maxj, hash[s[i]]);

            changes= (j-i)-maxf;

            if(changes<= k){
                maxlen= max(maxlen, j-i+1);


            }

            else{
                
                break;
                
            }

            

        }
    }
}