#include<bits/stdc++.h>;
using namespace std;

class dfs{
public:
    int dfs(){
        pq.push(node);
        while(!qp.empty()){
            auto it= pq.front();

            int wt= it[0];
            int h
        }
    }
}

struct node{
private:
    int data;
    struct* left;
    struct* right;

    node(int data , )

}

class solution{
private:
    int func(TreeNode* root){
        if(root==nullptr){
            return 0;

        }

        int left = func(root->left);
        int right= func(root->right);

        return 1+left + right;

    }
public:
    void dfs(vector<vector<char>>& grid, int row , int col){
        if(row<0 || row>=grid.size()|| col<0, col>=grid[0].size()||grid[row][col]== '0'){
            return ;
        }

        grid[row][col]= '0';
        dfs(grid, row+1, col);
        dfs(grid, row-1, col);
        dfs(grid, row, col+1);
        dfs(grid, row+1, col-1);
        dfs(grid, row , col);
    }
    

    int numsi(vector<vector<char>>& grid){
        if(grid.empty()){
            return 0;

        }

        int rows = grid.size();
        int cols = grid[0].size();
        int islands = 0;

        for(int i =0; i<rows; i++){
            for(int j=0; j<cols; j++){
                if(grid[i][j]=='1'){

                    islands++;
                    dfs(grid, i, j);
                    
                    

                }
            }
        }
        for(int i= 0 ; i<n; i++){
            for(int j=0;j <m; j++){

                if(grid[i][j]=='i');

                for(auto it = edges){

                    int wt= it.first.second();
                    int 
                }
            }
        }

        return islands;

    }
}

int main(){
    solution* s1= new solution();
    s1.dfs();
    

}