<script setup>
import { data } from './../.vitepress/theme/release.data'
</script>

# About Moseq-Reports
Interactive interrogation of MoSeq models.

## Purpose
In short, moseq-reports exists to democratize MoSeq data. Computational biologists often produce data which is difficult to parse without the proper tools or context, increasing access barriers for others to simply pick up and use. Moseq-reports allows wet-lab researchers to easily understand MoSeq models without having to reference outside sources or learn programming languages and manage complex software environments. This program reports data in a form which can be quickly understood by researchers while also providing a set of robust tools to reformat that data in such a way that would be most beneficial to their research.

## Papers that have utilized moseq-reports
Below is a listing of papers that have utilized moseq-reports in one way or another.
- A Tucker et al. Functional synaptic connectivity of engrafted spinal cord neurons with locomotor circuitry in the injured spinal cord. bioRxiv. April 5, 2025. [10.1101/2025.04.05.644402](https://doi.org/10.1101/2025.04.05.644402).

- JT Eisdorfer, JK Thackray et al. Using behavioral biomarkers to redefine epochs of spontaneous recovery following spinal cord injury. bioRxiv. February 13, 2025. [10.1101/2023.10.31.564826](https://doi.org/10.1101/2023.10.31.564826).

- C Nasello et al. Human mutations in high-confidence Tourette disorder genes affect sensorimotor behavior, reward learning, and striatal dopamine in mice. PNAS. April 29, 2024. [10.1073/pnas.2307156121](https://doi.org/10.1073/pnas.2307156121).

- MA Gradwell, N Ozeri-Engelhard et al. Multimodal sensory control of motor performance by glycinergic interneurons of the mouse spinal cord deep dorsal horn. Neuron. March 6, 2024. [10.1016/j.neuron.2024.01.027](https://doi.org/10.1016/j.neuron.2024.01.027).

- M Bohic, LA Pattison et al. Mapping the neuroethological signatures of pain, analgesia and recovery in mice. Neuron. July 12, 2023. [10.1016/j.neuron.2023.06.008](https://doi.org/10.1016/j.neuron.2023.06.008).

- LA Poppi et al. A cadherin mutation in Celsr3 linked to Tourette Disorder affects dendritic patterning and excitability of cholinergic interneurons. bioRxiv. March 7, 2022. [10.1101/2022.03.06.483205](https://doi.org/10.1101/2022.03.06.483205).



## Concepts

### What is MoSeq
MoSeq is short for motion sequencing. Using a depth camera, mice are recorded freely behaving in an arena. These videos are analyzed and labeled for specific syllables using machine learning. MoSeq was first described in [`Wiltschko et al. 2015. DOI: 10.1016/j.neuron.2015.11.031`](https://doi.org/10.1016/j.neuron.2015.11.031), but many papers utilizing this technology have since been published. If you are interested in using MoSeq, please visit the [MoSeq homepage](https://dattalab.github.io/moseq2-website/index.html). Once you have collected and modelled data with MoSeq, come back and use moseq-reports for your analysis!

### What is a syllable
A syllable is a stereotyped, reusable, action performed by an animal, as learned by the MoSeq algorithm. Syllables are concatenated in time (through transitions) to build up larger and more complex behaviors. Syllables are described by a linear dynamical system using 3D pose information (like that provided by a depth camera). Along with syllables, there is a grammar which dictates the way in which these syllables are put together (transitions). How often a Syllable is used by an animal can be summarized by counting the number of emissions (AKA counting by `usage`) or by summing the number of frames in which the animal is performing the Syllable (AKA counting by `frames`).

### `*.msq` Files
MSQ Files are the format from which the moseq-reports program reads data including video clips, usage data, transitions data, and other data. Think of it as a word document which requires the Microsoft Word program to access. Should you want to access the data stored in the msq file directly, you can change the extension from `.msq` to `.zip` and open it using a file archiver such as 7-Zip. For specific information on MSQ files, referenced the [Developer Guide](dev_guide/MSQInternals.md).

## Version Details
|Identifier|Value|
|:--|:--|
|App Version|{{ data.appVersion }}|
|Branch/Tag|{{ data.commitRef }}|
|Commit Hash|{{ data.commitHash }}|
