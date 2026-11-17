<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use `vite build` alone for production output; the Lovable TanStack configuration owns the output layout, so post-build scripts must not assume `.output/public` or delete `dist`.
- Render the course-road student with RoadmapStudent's photo layers and the existing scroll-position controller; this preserves the uploaded likeness and works without WebGL.
