# Mixture of Experts: from a 1991 paper to DeepSeek V3

Researched: 2026-11-06

## Sources

1. Robert A. Jacobs, Michael I. Jordan, Steven J. Nowlan, Geoffrey E. Hinton (1991). Adaptive Mixtures of Local Experts. Neural Computation 3, 79-87. https://www.cs.toronto.edu/~hinton/absps/jjnh91.pdf
2. David Eigen, Marc'Aurelio Ranzato, Ilya Sutskever (2013). Learning Factored Representations in a Deep Mixture of Experts. arXiv 1312.4314. https://arxiv.org/abs/1312.4314
3. Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, Jeff Dean (2017). Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer. arXiv 1701.06538. https://arxiv.org/abs/1701.06538
4. Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Jeff Dean (2016). Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer. ICLR 2017 submission on OpenReview, Wayback capture of 2016-11-13. https://web.archive.org/web/20161113053908/http://openreview.net/pdf?id=B1ckMDqlg
5. Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, Zhifeng Chen (2020). GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding. arXiv 2006.16668. https://arxiv.org/abs/2006.16668
6. Mistral AI (2023). Mixtral of experts. mistral.ai. https://mistral.ai/news/mixtral-of-experts
7. Albert Q. Jiang et al. (2024). Mixtral of Experts. arXiv 2401.04088. https://arxiv.org/abs/2401.04088
8. DeepSeek (2024). Introducing DeepSeek-V3. DeepSeek API Docs. https://api-docs.deepseek.com/news/news1226
9. DeepSeek-AI (2024). DeepSeek-V3 Technical Report. arXiv 2412.19437. https://arxiv.org/abs/2412.19437

## Links and evidence

- Adaptive Mixtures of Local Experts -> Deep Mixture of Experts: Confirmed, [2] arXiv v1, Section 1, page 1: "we extend the Mixture of Experts to use a different gating network at each layer"; the model is cited as ref. [4], Jacobs et al.
- Deep Mixture of Experts -> Sparsely-Gated MoE Layer: Confirmed, [3, 4] arXiv v1, Section 1.3, page 3: "Our work builds on this use of MoEs as a general purpose neural network component", after citing Eigen et al. (2013)
- Sparsely-Gated MoE Layer -> GShard: Confirmed, [5] Section 2.2, page 4: "The Mixture-of-Experts (MoE) layer used in our model is based on [16]"; ref. [16] is Shazeer et al.
- GShard -> Mixtral 8x7B: Confirmed, [6, 7] Section 2.1, page 3: "This formulation is similar to the GShard architecture [21]"
- GShard -> DeepSeek V3: Confirmed, [8, 9] Section 3.2, page 12: applies "64-way Expert Parallelism (EP) (Lepikhin et al., 2021)"; Section 2.1.2, page 8, compares: "Compared with traditional MoE architectures like GShard"

## Omitted

- Transformer (2017)
- Switch Transformer (2021)
- DeepSeekMoE (2024)
- DeepSeek R1 (2025)

## Notes

Dates. Adaptive Mixtures: the paper prints only 1991; Crossref gives 1991-02 and Semantic Scholar 1991-03, so the year is used. The paper says the idea was first presented at a summer school in 1988. Sparsely-Gated MoE: a version was public on OpenReview as an ICLR 2017 submission by 2016-11-13 (Wayback capture; the ICLR deadline was 2016-11-05), before arXiv v1 of 2017-01-23. Nothing opened gives the first day, so the year is used. The November 2016 version lists six authors; arXiv v1 lists seven, including Geoffrey Hinton. Later papers cite the work as 2017. The sentence quoted for the link from Deep Mixture of Experts is in arXiv v1; the 2016 version cites Eigen et al. as related work without it. Mixtral: the announcement is dated 2023-12-11, and Mistral AI posted a magnet link on X on 2023-12-08 (read through a mirror, because x.com could not be opened), so the month is used. DeepSeek V3: the DeepSeek-V3-Base page was public on Hugging Face by 2024-12-25 (Wayback capture), the announcement is dated 2024-12-26 and arXiv v1 2024-12-27, so the month is used. The timeline item is dated 2024-12-26. Names follow the timeline glossary (DeepSeek V3); the paper prints DeepSeek-V3. Mixtral also uses the top-K gating it cites to Shazeer et al. (Section 2.1, page 2, ref. [28]); that line is left out to keep the chart readable.
