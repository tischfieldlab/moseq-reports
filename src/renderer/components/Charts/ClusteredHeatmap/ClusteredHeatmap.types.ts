export enum OrderingType {
    Natural = "natural",
    Value = "value",
    HCluster = "hcluster",
    KCluster = "kcluster",
    Dataset = "dataset",
    Computed = "computed",
}

export enum HClusterDistance {
    AdditiveSymmetric = "additiveSymmetric",
    Avg = "avg",
    Bhattacharyya = "bhattacharyya",
    Canberra = "canberra",
    Chebyshev = "chebyshev",
    Clark = "clark",
    Czekanowski = "czekanowski",
    Dice = "dice",
    Divergence = "divergence",
    Euclidean = "euclidean",
    Fidelity = "fidelity",
    Gower = "gower",
    HarmonicMean = "harmonicMean",
    Hellinger = "hellinger",
    InnerProduct = "innerProduct",
    Intersection = "intersection",
    Jaccard = "jaccard",
    Jeffreys = "jeffreys",
    JensenDifference = "jensenDifference",
    JensenShannon = "jensenShannon",
    Kdivergence = "kdivergence",
    Kulczynski = "kulczynski",
    KullbackLeibler = "kullbackLeibler",
    KumarJohnson = "kumarJohnson",
    Lorentzian = "lorentzian",
    Manhattan = "manhattan",
    Matusita = "matusita",
    Motyka = "motyka",
    Neyman = "neyman",
    Pearson = "pearson",
    ProbabilisticSymmetric = "probabilisticSymmetric",
    Ruzicka = "ruzicka",
    Soergel = "soergel",
    Sorensen = "sorensen",
    Squared = "squared",
    SquaredChord = "squaredChord",
    SquaredEuclidean = "squaredEuclidean",
    Taneja = "taneja",
    Tanimoto = "tanimoto",
    Topsoe = "topsoe",
    WaveHedges = "waveHedges",
}
export enum HClusterLinkage {
    Single = "single",
    Complete = "complete",
    Average = "average",
    Weighted = "wpgma",
    Centroid = "centroid",
    Median = "median",
    Ward = "ward",
    Ward2 = "ward2",
}


export interface HClusterOptions {
    distance: HClusterDistance;
    linkage: HClusterLinkage;
}

export interface KClusterOptions {
    k: number;
}