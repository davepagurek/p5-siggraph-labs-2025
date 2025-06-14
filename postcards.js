console.log(postcards);
// Shuffle array
for (let i = 0; i < postcards.length; i++) {
  let idxA = Math.floor(Math.random() * postcards.length)
  let idxB = Math.floor(Math.random() * postcards.length)
  if (idxA > idxB) {
    [idxA, idxB] = [idxB, idxA]
  }

  const [removed] = postcards.splice(idxA, 1)
  postcards.splice(idxB - 1, 0, removed)
}

// Start with the example
postcards.unshift({ sketch: 'https://editor.p5js.org/davepagurek/sketches/yzSyIAqr0' })

const parent = document.getElementById('postcards')
postcards.forEach(({ sketch: url }, i) => {
  let iframe;
  const iframeSrc = url.replace('/sketches/', '/full/');

  const iframeContainer = document.createElement('div')
  iframeContainer.className = 'iframeContainer'

  const angle = Math.random() * 20 - 10;
  iframeContainer.setAttribute('style', `transform: rotate(${angle.toFixed(2)}deg)`)

  const container = document.createElement('div')
  container.className = 'postcard'
  container.appendChild(iframeContainer)

  const getScale = () => iframeContainer.offsetWidth / 600

  parent.appendChild(container)

  let mounted = false;
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (mounted !== entry.isIntersecting) {
        mounted = entry.isIntersecting
        if (mounted) {
          iframe = document.createElement('iframe')
          iframe.setAttribute('src', iframeSrc)
          iframe.setAttribute('width', 600)
          iframe.setAttribute('height', 442)
          iframe.style.transform = `scale(${getScale().toFixed(4)})`
          iframeContainer.appendChild(iframe)
        } else {
          iframeContainer.removeChild(iframe)
          iframe = undefined
        }
      }
    }),
    { rootMargin: '5px' },
  )
  observer.observe(iframeContainer)

  const resizer = new ResizeObserver((entries) => {
    if (iframe) {
      iframe.style.transform = `scale(${getScale().toFixed(4)})`
    }
  })
  resizer.observe(iframeContainer)
})
