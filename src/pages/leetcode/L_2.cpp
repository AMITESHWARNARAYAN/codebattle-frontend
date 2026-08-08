#include<bits/stdc++.h>
using namespace std;

class max{
public:
    
    int func(nums, k ){

        int lsum=0;
        int rsum=0;

        for(int i=0;i<k-1;i++){

            lsum=(sum+nums[i]);

            maxsum= lsum;

            rindes=n-1;
            
        }

        for(i=k-1;i>=0;i--){

            lsum=lsum-nums[i];

            rsum=rsum+nums[rindex];

            rindex=rindex-1;

            maxsum= max(maxsum, lsum + rsum);

        }

        return maxsum;
    }

public:
    int range(string s){
        
        int hash[256]={0};

        int n= s.size();

        int l=0, maxlen=0;

        while(r<n){

            if(hash[s[r]]!=-1){

                if(hash[s[r]]>=l){

                    l=hash[s[r]]+1;

                }
            }

            len=r-l+1;

            maxlen=max(len, maxlen);

            hash[s[r]]=r;

            r++;



        }

        returm maxlen;
        
    }
};

class next{
public:

int next_greater(int arr[], int next[]){

    stack<int> st;

    int s=arr.size();


    for(int i=n;i>=1; i--){

        while(!st.empty() && arr[i]>=st.top()){

            st.pop();

        }

        if(!st.empty()){

            next[arr[i]]=-1;


    
        }

        else{

            next[arr[i]]=st.top();

        }

        st.push(arr[i]);
        
    }
}
    
}

class max_max{
private:
    int dfs(){

        queue<int> q;

        vector<int> vis;
        vis[node]=1

        q.push(node);

        while(!q.empty()){

            auto it = q.front();
            q.pop();

            for(auto itt: edges){
                if(vis[itt]==0){

                    q.push(itt);
                }
            }
        }


    }
}

class partition{

bool ispalindrome(int i, int j, str){
    while(i<j){
        if(s[i]!=str[j]) return false;

        i++;
        j--;

    }

    return true;

}


int fu(int i, str){
    if(i==n) return 0;

    if(dp[i]!=-1) return dp[i];


    int mincost=INT_MAX;

    for(int j=i; j<n;j++){

        if(ispalindrome(i, j, str)){

            cost= 1+ fu(j+1, str);

            mincost=min(mincost, cost);

        }

    }

    return d[i]= mincost;

}

        

    
}


int dunction(){
    int n= arr.size();

    if(dp[i]!=-1) return dp[i];

    if(i==n) return 0 ;

    int max=INT_MIN;
    int len= 0;
    int maxi=0;

    for(int j=i; j<min(n, i+k);j++){

        maxi= max(maxi, arr[j]);
        cost= maxi*3+dunction(j+1);

        max=max(max, cost);


    }

    return  dp[i]=  max;
}

vector<int> shortest(){
    vector<int> dis(v);
    for(int i=0; i<v;i++){
        dist[i]=1e8;

        queue<int, int> qp;
        qp.push({0, s});
        dist[s]=0;

        while(!qp.empty()){

            auto it= qp.front();
            pq.pop();

            int  node= it.first();
            int dist= it.second();

            for(auto it: edges){

                int nodes=it.first();
                int edgew= it.second();

                if(edgew+dist< dist[nodes]){

                    dist[nodes]=edgew+dist;

                    qp.push({})
                }


            }
     


        }
    }
}

class prim{
private:
   int primss(){
    queue<pair<int,int>> pq;
    
   }
}

class max_sum{
public:
    int maxiii(ind,int  k)
    {
        int maxi, int max;

        int len=0;

        for(int i=ind; i<min(n , ind+k);i++){

            len++;

            maxi=max(maxi, arr[i]);

            cost=(maxi*len) + max_sum(i+1, k);

            max=max(max, cost);


        }

        return max;
    }
}

int bfs(){

    int tm=0;

    int delrow[]={-1, 0, 1, 0};
    int delcol[]={0, 1, 0, -1};




    while(!qp.empty()){

        int r= qp.front().first.first;
        int c=qp.front().first.second;
        int t=qp.front().second;

        tm=min(tm, t);

        for(int i=0;i<4;i++){
            int nrow=r+delrow[i];
            int ncol=c+delcol[i];
            if(ncol>=0 && ncpl<n && ncol>==0 && ncol<m && ){
                
            }
        }




    }
}


class kadane{
public:
    int max_sum(){
        int max=INT_MIN;
        int sum=0;

        for(int i=0;i<n;i++){
            sum+=arr[i];

            if(sum<0){
                sum=0;
                
            }
            esle{
                max=max(sum, max);

            }
        }

        return max;
        
    }
}